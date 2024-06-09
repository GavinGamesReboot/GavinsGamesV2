# Gavin's Games

Hi! I am Gavin Caldwell, I am a 13-year-old developer, and this is my first creation on my journey. Feel free to donate to me via my Patreon or my "Buy Me A Coffee," which can be found in either my GitHub account or my gaming website. The links can also be found right here:

[Buy Me A Coffee](https://www.buymeacoffee.com/GavinsGames)

[My Patreon](https://patreon.com/GavinsGamesReboot?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink)

I also own three websites:

[Gavinsoft.com](https://gavinsoft.com)

[GavinsGames.com](https://gavinsgames.com)

[GavinCaldwell.com](https://gavincaldwell.com)

## Contributing

Thank you for your interest in contributing to Gavin's Games! Here’s a simple guide to help you add new games to the repository.

### How to Add a New Game

1. **Clone the Repository**

   Clone the repository to your local machine using the following command:

```
git clone https://github.com/GavinCaldwell/gavins-games.git
cd gavins-games
```

2. **Create a New Branch**

   Create a new branch for your game addition:

```
git checkout -b add-new-game
```

3. **Add a New Game Folder**

Inside the `data/games/` directory, create a new folder for your game. The folder should contain:
- An HTML file for the game (e.g., `newgame.html`)
- An image file for the game thumbnail (e.g., `newgame.png`)

Example structure:

data/
└── games/
└── NewGame/
├── newgame.html
└── newgame.png

4. **Update the Grid Item**

In the appropriate HTML file (`OPEN WEBSITE HERE.html`, `other_games.html`, `tools.html`, `emulators.html`), add a new grid item for your game. Follow the existing format:

```
<div class="grid-item" data-name="New Game">
    <a href="data/games/NewGame/newgame.html" target="_blank">
        <img src="data/games/NewGame/newgame.png" alt="New Game">
        <p>New Game</p>
    </a>
</div>
```

5. **Commit Your Changes**

Add and commit your changes:

```
git add .
git commit -m "Added New Game"
```

6. **Push to Your Fork**

Push the changes to your GitHub repository:

```
git push origin add-new-game
```

7. **Submit a Pull Request**

Go to the original repository on GitHub and submit a pull request from your branch. Make sure to describe the changes you have made and mention the new game you are adding.

Thank you for contributing to Gavin's Games!