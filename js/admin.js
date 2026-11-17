import { chargerDonnees,deleteContent } from "./api.js";

const table=document.getElementById("contents-table");
const message=document.getElementById("message");

function afficherContenus(contents){
    table.innerHTML=contents.map(content=>{
        return `
            <tr>
                <td><img src="${content.image}"
                <td>${content.title}</td>
                <td>${content.type}</td>
                <td>${content.releaseYear}</td>
                <td>
                    <button>Modifier</button>
                    <button>Supprimer</button>
                </td>
            </tr>`;
    }).join("")
}

// charger les contenus depuis MockAPI
async function initialiserAdmin() {
    try{
        const contents = await chargerDonnees();
        afficherContenus(contents)
        message.textContent="";
    }catch (error){
        console.error("Erreur du chargement contenus.")
    }   
}
initialiserAdmin()