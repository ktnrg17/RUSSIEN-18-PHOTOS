/* =========================================
   RUSSIEN @18 PHOTO UPLOAD QR
========================================= */


/*
    THIS IS WHERE THE QR CODE WILL SEND GUESTS.

    Change this only if your GitHub folder
    has a different name.
*/

const uploadPage =
    "https://ktnrg17.github.io/RUSSIEN-XVIII/p/upload.html";


/*
    CREATE QR CODE
*/

new QRCode(
    document.getElementById("qrcode"),
    {
        text: uploadPage,

        width: 220,
        height: 220,

        colorDark: "#553f4c",
        colorLight: "#ffffff",

        correctLevel: QRCode.CorrectLevel.H
    }
);
