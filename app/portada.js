// Redireccionar a "menu.html" después de 5 segundos
setTimeout(function(){
    window.location.href = "menu.html";
}, 5000); 

// Tu API Key de GIPHY
const apiKey = 'NZjROKG4gC1cieYTrg8G9TQDgJz3n8Lf';

// URL de la API de GIPHY
const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=alien`;

// Llamada a la API
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const gifs = data.data;
        const gifContainer = document.getElementById('gif-container');

        gifs.forEach(gif => {
            const gifElement = document.createElement('img');
            gifElement.src = gif.images.fixed_height.url;
            gifElement.alt = gif.title;
            gifContainer.appendChild(gifElement);
        });
    })
    .catch(error => {
        console.error('Error fetching data from GIPHY API:', error);
    });