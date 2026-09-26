const SUPABASE_URL =
    "https://magaomtlctseieufgijk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nIm23K5lShcFGJ6m18DzaA_EAXQXGc0";

const BUCKET_NAME =
    "photos";

const MAX_PHOTOS =
    20;


const photoInput =
    document.getElementById("photoInput");

const fileCount =
    document.getElementById("fileCount");

const previewContainer =
    document.getElementById("previewContainer");

const uploadButton =
    document.getElementById("uploadButton");

const message =
    document.getElementById("message");

const progressContainer =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");


const nickname =
    sessionStorage.getItem("russienNickname");

const accessToken =
    sessionStorage.getItem("russienAccessToken");


/*
=========================================
CHECK LOGIN
=========================================
*/

if (!nickname || !accessToken) {

    window.location.href =
        "nickname.html";

}


/*
=========================================
SELECT PHOTOS
=========================================
*/

photoInput.addEventListener(
    "change",
    () => {

        const files =
            Array.from(photoInput.files);


        if (files.length > MAX_PHOTOS) {

            message.textContent =
                "Please select no more than 20 photos.";

            message.className =
                "message error";

            photoInput.value = "";

            fileCount.textContent =
                "No photos selected";

            previewContainer.innerHTML =
                "";

            uploadButton.disabled =
                true;

            return;

        }


        message.textContent =
            "";

        message.className =
            "message";


        fileCount.textContent =
            files.length === 0
                ? "No photos selected"
                : `${files.length} photo${files.length > 1 ? "s" : ""} selected`;


        previewContainer.innerHTML =
            "";


        files.forEach(file => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const item =
                        document.createElement("div");

                    item.className =
                        "preview-item";


                    const image =
                        document.createElement("img");

                    image.src =
                        event.target.result;

                    image.alt =
                        "Selected photo";


                    item.appendChild(image);

                    previewContainer.appendChild(item);

                };


            reader.readAsDataURL(file);

        });


        uploadButton.disabled =
            files.length === 0;

    }
);


/*
=========================================
UPLOAD PHOTOS
=========================================
*/

uploadButton.addEventListener(
    "click",
    async () => {

        const files =
            Array.from(photoInput.files);


        if (!nickname || !accessToken) {

            window.location.href =
                "nickname.html";

            return;

        }


        if (files.length === 0) {

            return;

        }


        uploadButton.disabled =
            true;


        progressContainer.hidden =
            false;


        message.textContent =
            "";

        message.className =
            "message";


        let uploadedCount =
            0;


        try {

            /*
            Get current Supabase user
            */

            const userResponse =
                await fetch(
                    `${SUPABASE_URL}/auth/v1/user`,
                    {
                        method: "GET",

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${accessToken}`
                        }
                    }
                );


            if (!userResponse.ok) {

                throw new Error(
                    "Your login session has expired. Please log in again."
                );

            }


            const user =
                await userResponse.json();


            /*
            Upload every selected photo
            */

            for (const file of files) {

                progressText.textContent =
                    `Uploading photo ${uploadedCount + 1} of ${files.length}...`;


                const safeNickname =
                    nickname
                        .replace(
                            /[^a-zA-Z0-9_-]/g,
                            "_"
                        )
                        .substring(
                            0,
                            30
                        );


                const fileName =
                    `${Date.now()}-${crypto.randomUUID()}-${file.name}`;


                /*
                IMPORTANT:
                First folder = user ID.
                This is used for delete permissions.
                */

                const filePath =
                    `${user.id}/${safeNickname}/${fileName}`;


                /*
                Upload file to Storage
                */

                const uploadResponse =
                    await fetch(
                        `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${accessToken}`,

                                "apikey":
                                    SUPABASE_KEY,

                                "Content-Type":
                                    file.type
                            },

                            body: file
                        }
                    );


                if (!uploadResponse.ok) {

                    const errorText =
                        await uploadResponse.text();

                    throw new Error(
                        errorText
                    );

                }


                /*
                Create public image URL
                */

                const photoUrl =
                    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;


                /*
                Save photo information
                */

                const databaseResponse =
                    await fetch(
                        `${SUPABASE_URL}/rest/v1/photos`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${accessToken}`,

                                "apikey":
                                    SUPABASE_KEY,

                                "Content-Type":
                                    "application/json",

                                "Prefer":
                                    "return=minimal"
                            },

                            body: JSON.stringify({

                                nickname:
                                    nickname,

                                photo_url:
                                    photoUrl,

                                user_id:
                                    user.id

                            })
                        }
                    );


                if (!databaseResponse.ok) {

                    const errorText =
                        await databaseResponse.text();

                    throw new Error(
                        errorText
                    );

                }


                uploadedCount++;


                progressBar.style.width =
                    `${(uploadedCount / files.length) * 100}%`;

            }


            /*
            Finished
            */

            progressText.textContent =
                "All photos uploaded successfully!";


            message.textContent =
                "Your memories have been added to the celebration gallery.";

            message.className =
                "message success";


            photoInput.value =
                "";


            fileCount.textContent =
                "No photos selected";


            previewContainer.innerHTML =
                "";


            setTimeout(() => {

                window.location.href =
                    "gallery.html";

            }, 1200);


        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );


            message.textContent =
                "Upload error: " +
                error.message;

            message.className =
                "message error";


            progressText.textContent =
                "Upload failed.";


            uploadButton.disabled =
                false;

        }

    }
)
