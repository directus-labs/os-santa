# OS Santa Directus Template

The `directus` directory holds a sample Docker Compose file that you can use to quickly spin up a local version of Directus along with the Salty Open Source Santa template in JSON format.

We 100% recommend using Docker if you want to run Directus locally or self-host on your own infrastructure. It easiest way to get up and running and it prevents a lot of environment specific issues inside Node.

## Running Directus with Docker

To set up Directus using Docker, follow these steps:

1. **Install Docker**: Ensure Docker is installed on your machine. You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop).

2. **Navigate to the `directus` Directory**: Open your terminal and navigate to the `directus` directory where the Docker Compose file is located.

3. **Start the Docker Containers**: Run the following command to start the Directus instance:

   ```bash
   docker-compose up -d
   ```

   This command will start the Directus service in detached mode.

4. **Access Directus**: Once the containers are running, you can access your Directus instance by navigating to `http://localhost:8055` in your web browser.

## Applying the Template

To apply this template to your Directus instance, you will use the Directus Template CLI. This tool allows you to manage and apply template configurations across different Directus instances.

### Prerequisites

- A Directus instance, either on [Directus Cloud](https://directus.cloud?ref=directus-labs%2Fos-santa) or self-hosted.
- A Static Access Token for the admin user.
- The Directus URL of your instance.

### Steps to Apply the Template

1. **Create a Directus Instance**: Set up your Directus instance on Directus Cloud or self-hosted.
2. **Generate a Static Access Token**: Log in to your Directus instance and create a Static Access Token for the admin user.
3. **Copy Credentials**: Note down your Directus URL and the Static Access Token.
4. **Apply the Template**: Open your terminal and run the following command:

   ```bash
   npx directus-template-cli@latest apply
   ```

   Follow the prompts to select and apply the template.

## Important Notes

- **Backup**: Always make backups of your project/database before applying templates.
- **Compatibility**: Ensure your Directus version is compatible with the CLI version.
- **Dependencies**: Be aware of component dependencies when using partial application.

For more detailed instructions and options, refer to the [Directus Template CLI documentation](https://github.com/directus-labs/directus-template-cli/).
