# Yao Website

https://github.com/user-attachments/assets/5a01a2f4-49ea-4d31-87c7-1ed8a7512c95

The official website for Yao. [https://yaoapps.com](https://yaoapps.com)

## Usage

Install the Yao v0.10.4-rc.1 or later version.

👉 [Install Yao](https://yaoapps.com/docs/documentation/en-us/getting-started/installation)

```bash
### Clone the repository
git clone https://github.com/YaoApp/website.git yao-website

# Enter the project directory
cd yao-website

## Initialize ( First time only )
yao migrate --reset
yao run scripts.test.Data

## Add administrator account ( First time only )
yao run models.admin.user.Save '::{"email":"demo@moapi.ai","password":"demo@5099", "type":"admin"}'
```

## Development

**Step1: Start the development server**

```bash
## Start the http server
cd /path/to/yao-website
yao start
```

**Step2: Watch the template files and compile them**

```bash
## Keep the server running and open a new terminal
## Watch the template files and compile them
cd /path/to/yao-website
yao sui watch web default
```

## AI Integration Configuration

**Step1: Add Connector**

Create a new connector file in the `/connectors` directory. (make directory if not exists)

```jsonc
// path: /connectors/gpt-4o.conn.yao
{
  "label": "Model gpt-4o", // The name of the model for display
  "type": "openai", // The type of the connector, openai only for now
  "options": {
    "model": "gpt-4o", // The AI Model name
    "key": "$ENV.OPENAI_API_KEY" // The API key, supports environment variables
    // "proxy": "http://ip:port" // Optional proxy server, if needed
  }
}
```

**Step2: Add the connector to the Neo configuration**

Add the connector to the Neo configuration file `/neo/neo.yml`

```yaml
# guard: "scripts.neo.Guard" # Custom guard, you can use it to check if the user is allowed to access the AI model

conversation:
  connector: default
  table: yao_neo_conversation
  max_size: 10
  ttl: 3600

#########################################################
### CHANGE THE CONNECTOR NAME TO THE ONE YOU CREATED ####
#########################################################
connector: "gpt-4o" # Connector Widget ID
prepare: "scripts.ai.neo.Prepare" # Prepare hook, you can use it to modify the input before sending it to the AI model.
write: "scripts.ai.neo.Write" # Write hook, you can use it to modify the output before sending it to the user

option:
  temperature: 0.6

allows:
  - "http://127.0.0.1:8000"
  - "http://127.0.0.1:5099"
  - "http://localhost:5099"
  - "http://localhost:8000"
```

**Step3: Restart the server**

```bash
## Restart the server
## Ctrl + C to stop the server and start it again
yao start
```
