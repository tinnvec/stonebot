[![Add Stonebot to your Server][discord-add-badge]][discord-oauth-link]

# Stonebot
Watches for one or more `[hearthstone card name]` in text channels and displays the card image(s) when found.

## Docker Instructions
1. Clone the repository
    ```bash
    https://github.com/tinnvec/stonebot.git
    cd stonebot
    mv config/config.sample.yml config.yml
    ```
2. Edit `config/config.yml` with your info
3. Build and run docker image
    ```bash
    docker build -t stonebot .
    docker run -d --name stonebot stonebot
    ```

[discord-oauth-link]: https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456
[discord-add-badge]: https://img.shields.io/badge/Discord-Add%20Bot-7289DA.svg?style=flat-square