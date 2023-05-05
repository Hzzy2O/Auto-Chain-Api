### GET /

获取AI列表

#### Response

- `list` (`Array`): AI列表

  - `id` (`String`): AI的唯一标识符
  - `ai_name` (`String`): AI名称
  - `ai_role` (`String`): AI角色
  - `ai_goals` (`Array`): AI目标
  - `messages` (`Array`): AI交互过的消息
  - `finish` (`Boolean`): AI是否已完成
      
### POST /create

获取AI列表

#### Request Body

- `ai_name` (String): AI名称
- `ai_role` (String): AI角色
- `ai_goals` (Array): AI目标

#### Response
- `id` (String): 新创建AI的唯一标识符

### POST /run

运行指定的AI

#### Request Body

- `gpt_id` (`String`): 要运行的AI的唯一标识符

#### Response

- `reply_json` (`Object`): AI返回的回复
- `tool_result` (`Object`): AI工具返回的结果
- `finish` (`Boolean`): AI是否已完成
- `has_file` (`Boolean`): AI是否有输出文件

### POST /delete

删除指定的AI

#### Request Body
- `gpt_id` (String): 要删除的AI的唯一标识符

#### Response
 String: 删除成功的提示信息

### POST /download

下载指定AI的文件

#### Request Body

- `gpt_id` (`String`): 要下载文件的AI的唯一标识符
- `path` (`String`): 要下载的文件路径

#### Response

- 指定文件blob

### POST /file
获取指定AI的所有文件信息

#### Request Body
- `gpt_id` (String): 要获取文件信息的AI的唯一标识符

#### Response
Array: AI的所有文件信息

### Validation

请求体必须包含以下属性：

- `/create`, `/run`, `/delete`, `/download`, `/file`: 

  - `gpt_id` (`String`): 要操作的AI的唯一标识符

- `/create`:

  - `ai_name` (`String`): AI名称
  - `ai_role` (`String`): AI角色
  - `ai_goals` (`Array`): AI目标

- `/download`:

  - `path` (`String`): 要下载的文件路径

#### Errors

- `400 Bad Request`: 请求体缺少必要属性时

- `message` (`String`): 错误信息

