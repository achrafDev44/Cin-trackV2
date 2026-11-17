import { chargerDonnees,deleteContent } from "./api.js";

const table=document.getElementById("contents-table");
const message=document.getElementById("message");

let items=[];

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
                    <button class="delete-btn" data-id="${content.id}">Supprimer</button>
                </td>
            </tr>`;
    }).join("")
    activerSuppression();
}

function activerSuppression(){
    const buttons=document.querySelectorAll(".delete-btn");

    buttons.forEach(button=>{
        button.addEventListener("click",async function(){
            // récupérer identifiant du contenu
            const id=button.dataset.id;
            console.log("ID du contenu :",id)
            const confirmation=confirm("voulez-vous vraiment supprimer ce contenu?")
            if(confirmation){
                await deleteContent(id);

                items=items.filter(item =>item.id !=id);
                afficherContenus(items);
                // actualiser le tableau aprés la suppression
                initialiserAdmin();
           }
        })
    })
}

// charger les contenus depuis MockAPI
async function initialiserAdmin() {
    try{
        items = await chargerDonnees();
        afficherContenus(items)
        message.textContent="";
    }catch (error){
        console.error("Erreur du chargement contenus.")
    }   
}
initialiserAdmin()