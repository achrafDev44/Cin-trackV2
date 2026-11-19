 import { chargerDonnees,deleteContent,createContent,updateContent } from "./api.js";

const table=document.getElementById("contents-table");
const message=document.getElementById("message");
const form=document.getElementById("content-form")

const modal=document.getElementById("content-modal");
const openModal=document.getElementById("open-modal");
const closeModal=document.getElementById("close-modal");

openModal.addEventListener("click",function(){
    modal.classList.remove("hidden");
    modal.classList.add("flex");
});

closeModal.addEventListener("click",function(){
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    reinitialiserFormulaire();
});

let items=[];
// savoir en train ajouter ou modifier ,stocke id
let editingId=null;

function reinitialiserFormulaire(){
    // vider les champs
    form.reset();
    // revenir mode ajout
    editingId=null;
    document.getElementById("form-title").textContent="Ajouter un contenu";
    document.getElementById("submit-btn").textContent="Ajouter"
}

function afficherContenus(contents){
    table.innerHTML=contents.map(content=>{
        return `
            <tr>
                <td><img src="${content.image}" width="60"></td>
                <td>${content.title}</td>
                <td>${content.type}</td>
                <td>${content.releaseYear}</td>
                <td>
                    <button class=" edit-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg mr-2" data-id="${content.id}">Modifier</button>
                    <button class="delete-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg" data-id="${content.id}">Supprimer</button>
                </td>
            </tr>`;
    }).join("")
    activerSuppression();
    activerModification();
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

function activerModification(){
    const buttons=document.querySelectorAll(".edit-btn");

    buttons.forEach(button=>{
        button.addEventListener("click",function(){
            const id =button.dataset.id;
            const item=items.find(i=>i.id==id);
            editingId=id;

            document.getElementById("title").value=item.title;
            document.getElementById("type").value=item.type;
            document.getElementById("releaseYear").value=item.releaseYear;
            document.getElementById("image").value=item.image;

            document.getElementById("duration").value=item.duration || "";
            document.getElementById("seasons").value=item.seasons || "";
            document.getElementById("genres").value=item.genres.join(",");
            // || undefined
            document.getElementById("form-title").textContent="Modifier un contenu";
            document.getElementById("submit-btn").textContent="Enregistrer";

            modal.classList.remove("hidden")
            modal.classList.add("flex")
        })    
    })
}

// recupere les donnees
function getFormData(){
    const seasons=[]
    for (let i=1;i<=Number(document.getElementById("seasons").value);i++)
    {
        seasons.push(i);
    }
    const data={
        title:document.getElementById("title").value,
        type:document.getElementById("type").value,
        releaseYear:document.getElementById("releaseYear").value,
        image:document.getElementById("image").value,
        duration:document.getElementById("duration").value,
        seasons:Number(document.getElementById("seasons").value) || 0,
        genres:document.getElementById("genres").value.split(",").map(g=>g.trim())
    }
    return data;
}

form.addEventListener("submit",async function(event){
    event.preventDefault()
    // recupere toute les donnees du formulaire
    const data=getFormData();
    console.log("donnees envoyee :", data)
    if(editingId===null){
        await createContent(data);
        items=await chargerDonnees()
        afficherContenus(items)
        message.textContent="Contenu ajouté avec succès."
    }else{
        const item=items.find(i=>i.id===editingId)
        // update ancienne donnees et nouvelle
        const updated={...item,...data}
        // updateConten envoie  modification avec put
        await updateContent(editingId,updated)

        items=await chargerDonnees()
        afficherContenus(items)

        message.textContent="Contenu modifié avec succès"
    }
    // prochaine envoi considerer comme nouvell ajout
    editingId=null
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    reinitialiserFormulaire();


})
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