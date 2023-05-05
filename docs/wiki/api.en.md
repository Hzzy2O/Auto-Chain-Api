### GET /

Get AI list

#### Response

- `list` (`Array`): List of AIs

  - `id` (`String`): Unique identifier of AI
  - `ai_name` (`String`): Name of AI
  - `ai_role` (`String`): Role of AI
  - `ai_goals` (`Array`): Goals of AI
  - `messages` (`Array`): Messages that AI has interacted with
  - `finish` (`Boolean`): Whether the AI has finished or not
      
### POST /create

Create a new AI

#### Request Body

- `ai_name` (String): Name of AI
- `ai_role` (String): Role of AI
- `ai_goals` (Array): Goals of AI

#### Response
- `id` (String): Unique identifier of the newly created AI

### POST /run

Run a specified AI

#### Request Body

- `gpt_id` (`String`): Unique identifier of the AI to be run

#### Response

- `reply_json` (`Object`): Reply returned by AI
- `tool_result` (`Object`): Result returned by AI tool
- `finish` (`Boolean`): Whether the AI has finished or not
- `has_file` (`Boolean`): Whether the AI has an output file or not

### POST /delete

Delete a specified AI

#### Request Body
- `gpt_id` (String): Unique identifier of the AI to be deleted

#### Response
 String: Message indicating successful deletion

### POST /download

Download a file from a specified AI

#### Request Body

- `gpt_id` (`String`): Unique identifier of the AI to download file from
- `path` (`String`): Path of the file to be downloaded

#### Response

- Blob of the specified file

### POST /file
Get information of all files from a specified AI

#### Request Body
- `gpt_id` (String): Unique identifier of the AI to get file information from

#### Response
Array: Information of all files from the AI

### Validation

The request body must contain the following properties:

- `/create`, `/run`, `/delete`, `/download`, `/file`: 

  - `gpt_id` (`String`): Unique identifier of the AI to operate on

- `/create`:

  - `ai_name` (`String`): Name of AI
  - `ai_role` (`String`): Role of AI
  - `ai_goals` (`Array`): Goals of AI

- `/download`:

  - `path` (`String`): Path of the file to be downloaded

#### Errors

- `400 Bad Request`: When the request body is missing required properties

- `message` (`String`): Error message

