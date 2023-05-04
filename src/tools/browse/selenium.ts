import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { WebDriver } from 'selenium-webdriver'
import { Builder, By, until } from 'selenium-webdriver'
import { Options as ChromeOptions } from 'selenium-webdriver/chrome'
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox'
import { Options as SafariOptions } from 'selenium-webdriver/safari'
import { JSDOM } from 'jsdom'

import { summarizeText } from '../processing/text'
import { extractHyperlinks, formatHyperlinks } from '../processing/html'
import { Config } from '@/config'

export async function browseWebsiteWithSelenium(url: string, question: string) {
  const [driver, text] = await scrapeTextWithSelenium(url)
  await addHeader(driver)
  const summaryText = await summarizeText(url, text, question, driver)
  const links = await scrapeLinksWithSelenium(driver, url)

  if (links.length > 5)
    links.length = 5

  closeBrowser(driver)
  return `Answer gathered from website: ${summaryText} \n \n Links: ${links}`
}

async function scrapeTextWithSelenium(url: string): Promise<[WebDriver, string]> {
  const optionsAvailable = {
    chrome: ChromeOptions,
    safari: SafariOptions,
    firefox: FirefoxOptions,
  }

  const browserOptions = new optionsAvailable[Config.SELENIUM_BROWSER]()
  browserOptions.addArguments(
    'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.49 Safari/537.36',
  )

  if (Config.SELENIUM_BROWSER === 'firefox') {
    // Add any firefox specific options here
  }
  else if (Config.SELENIUM_BROWSER === 'safari') {
    // Add any safari specific options here
  }
  else {
    if (process.platform === 'linux') {
      browserOptions.addArguments('--disable-dev-shm-usage')
      browserOptions.addArguments('--remote-debugging-port=9222')
    }

    browserOptions.addArguments('--no-sandbox')
    if (Config.SELENIUM_HEADLESS) {
      browserOptions.addArguments('--headless')
      browserOptions.addArguments('--disable-gpu')
    }
  }

  const driver: WebDriver = await new Builder()
    .forBrowser(Config.SELENIUM_BROWSER)
    .setChromeOptions(browserOptions)
    .build()

  await driver.get(url)
  await driver.wait(until.elementLocated(By.css('body')), 10000)

  const pageSource: string = await driver.executeScript('return document.body.outerHTML;')
  const { window } = new JSDOM(pageSource)
  const document = window.document

  Array.from(document.querySelectorAll('script, style')).forEach((element) => {
    element.remove()
  })

  const text = document.body.textContent || ''
  const lines = text.split('\n').map(line => line.trim())
  const chunks = lines.flatMap(line => line.split('  ').map(phrase => phrase.trim()))
  const cleanedText = chunks.filter(chunk => chunk).join('\n')

  return [driver, cleanedText]
}

async function scrapeLinksWithSelenium(driver: WebDriver, url: string): Promise<string[]> {
  const pageSource = await driver.getPageSource()
  const { window } = new JSDOM(pageSource)
  const document = window.document

  Array.from(document.querySelectorAll('script, style')).forEach((element) => {
    element.remove()
  })

  const hyperlinks = extractHyperlinks(document, url)
  return formatHyperlinks(hyperlinks)
}

function closeBrowser(driver: WebDriver): void {
  driver.quit()
}

async function addHeader(driver: WebDriver): Promise<void> {
  const overlayJs = readFileSync(join(__dirname, './js/overlay.js'), 'utf8')
  await driver.executeScript(overlayJs)
}
