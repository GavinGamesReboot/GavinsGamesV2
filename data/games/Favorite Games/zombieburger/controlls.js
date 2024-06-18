//Keydown events
onkeydown = e => {
    if(data.running) {
                                    //Support for azerty keyboards
        if      (e.keyCode == 65)   navigator.language.includes('fr') ? data.player1.drop() : data.player1.speedX = -.02;
        else if (e.keyCode == 68)   data.player1.speedX = .02;
        else if (e.keyCode == 83)   data.player1.speedY = .02;
        else if (e.keyCode == 87)   data.player1.speedY = -.02;
        else if (e.keyCode == 90)   data.player1.speedY = -.02;
        else if (e.keyCode == 69)   data.player1.equip();
        else if (e.keyCode == 32)   data.player1.startuse();
        else if (e.keyCode == 81)   navigator.language.includes('fr') ? data.player1.speedX = -.02 : data.player1.drop();

        else if (e.keyCode == 37)   data.player2.speedX = -.02;
        else if (e.keyCode == 39)   data.player2.speedX = .02;
        else if (e.keyCode == 38)   data.player2.speedY = -.02;
        else if (e.keyCode == 40)   data.player2.speedY = .02;
        else if (e.keyCode == 96)   data.player2.startuse();
        else if (e.keyCode == 13)   data.player2.equip();
        else if (e.keyCode == 16 && e.location == 2)   data.player2.drop();

    }
}
//Keyup events
onkeyup = e => {

    if(data.running) {

        if      (e.keyCode == 65 && !navigator.language.includes('fr'))   data.player1.speedX = 0;
        else if (e.keyCode == 68)   data.player1.speedX = 0;
        else if (e.keyCode == 83)   data.player1.speedY = 0;
        else if (e.keyCode == 87)   data.player1.speedY = 0;
        else if (e.keyCode == 90)   data.player1.speedY = 0;
        else if (e.keyCode == 81 && navigator.language.includes('fr'))   data.player1.speedX = 0;
        else if (e.keyCode == 32)   data.player1.releaseuse();
        else if (e.keyCode == 37)   data.player2.speedX = 0;
        else if (e.keyCode == 39)   data.player2.speedX = 0;
        else if (e.keyCode == 38)   data.player2.speedY = 0;
        else if (e.keyCode == 40)   data.player2.speedY = 0;
        else if (e.keyCode == 96)   data.player2.releaseuse();
    }

}
