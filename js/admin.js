 import { chargerDonnees,deleteContent,createContent,updateContent,getComments,request } from "./api.js";

const table=document.getElementById("contents-table");
const message=document.getElementById("message");
const form=document.getElementById("content-form")

const modal=document.getElementById("content-modal");
const openModal=document.getElementById("open-modal");
const closeModal=document.getElementById("close-modal");

// modal Details
const detailsModal=document.getElementById("details-modal");
const closeDetailsModal=document.getElementById("close-details-modal");
const detailsTitle=document.getElementById("details-title");

const commentsLoading=document.getElementById("comments-loading");
const commentList=document.getElementById("comments-list")

// recuperer les element du formulaire commentaires
const commentForm=document.getElementById("comment-form");
const commentAuthor=document.getElementById("comment-author");
const commentText=document.getElementById("comment-text");
const errorCommentAuthor=document.getElementById("error-comment-author");
const errorCommentText=document.getElementById("error-comment-text");

// garder identifier du contenu selectionne
let selectedContentId=null;

openModal.addEventListener("click",function(){
    modal.classList.remove("hidden");
    modal.classList.add("flex");
});

closeModal.addEventListener("click",function(){
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    reinitialiserFormulaire();
});

commentForm.addEventListener("submit", async function(event){
    event.preventDefault();
    const author=commentAuthor.value.trim();
    const text=commentText.value.trim();

    if (author==="") {
        errorCommentAuthor.textContent="Le nom est obligatoire."
    }else{
        errorCommentAuthor.textContent="";
    }

    if (text==="") {
        errorCommentText.textContent="Le commentaire est obligatoire."
    }else{
        errorCommentText.textContent="";
    }
    if (author === "" || text=== "") {
        return;
    }
    const newComment=await request("/comments",{
        method: "POST",
        body:JSON.stringify({
            contentId: selectedContentId,
            author: author,
            text :text,
            createdAt: new Date()

        })
    })
    // recuperer toute les commentaire depuis api
    const all=await getComments();

    //  Garder uniquement les commentaires du contenu sélectionné
    const comment=all.filter(c=>c.contentId==selectedContentId);
    // afficher tout les commentaire
    commentList.innerHTML=comment.map(comment=>`
        <div class="bg-gray-700 p-3 rounded-lg">
            <h4 class="font-bold">${comment.author}</h4>
            <p class="text-gray-400 text-sm">${comment.createdAt}</p>
            <p class="mt-2">${comment.text}</p>
        </div>
    `).join("");
    commentForm.reset();
    // effacer  message erreur
    errorCommentAuthor.textContent="";
    errorCommentText.textContent="";
})

let items=[];
// savoir en train ajouter ou modifier ,stocke id
let editingId=null;

function reinitialiserFormulaire(){
    // vider les champs
    form.reset();
    // effacer toute les messages erreur
    document.querySelectorAll('[id^="error-"]').forEach(error=>{
        error.textContent="";
    })
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
                    <button class=" edit-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg mr-2" data-id="${content.id}">
                        Modifier
                    </button>

                    <button class=" details-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg mr-2" data-id="${content.id}">
                        Détails
                    </button>

                    <button class="delete-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg" data-id="${content.id}">
                        Supprimer
                    </button>
                </td>
            </tr>`;
    }).join("")
    activerSuppression();
    activerModification();
    activerDetails();
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

function activerDetails(){
    const buttons=document.querySelectorAll(".details-btn")
    buttons.forEach(button=>{
        button.addEventListener("click", async function(){
            // recuperer identifiant
            const id=button.dataset.id;
            
            selectedContentId=id
             // chercher le contenu
            const item=items.find(i=>i.id==id);
            detailsTitle.textContent=item.title;

             // afficher modal
            detailsModal.classList.remove("hidden");
            detailsModal.classList.add("flex");

            commentsLoading.textContent="Chargement des  commentaires...";
            // afficher 
            commentsLoading.classList.remove("hidden")
            commentList.innerHTML="";

            // recuperer tous les commantaires depauis api
            const all=await getComments();
            // garder les comentaire selectionné
            const comments=all.filter(c=>c.contentId==selectedContentId)
            
            if (comments.length===0) {
                commentList.textContent="Aucun commentaire";
            }else{
                commentList.innerHTML=comments.map(comments=>`
                    <div class="bg-gray-700 p-3 rounded-lg

                        <!-- afficher le nom de l'auteur-->
                        <h4 class="font-bold">${comments.author}</h4>
                        <!-- afficher la date-->
                        <p class="text-gray-400 text-sm">${comments.createAt}</p>
                        <!-- afficher le texte du commentaire-->
                        <p class="mt-2">${comments.text}</p>
                    </div>`).join("");
            }
            // cacher message chargement
            commentsLoading.classList.add("hidden")
        
        })
    })
}
// fermer modal details
closeDetailsModal.addEventListener("click",function(){
    detailsModal.classList.add("hidden");
    detailsModal.classList.remove("flex");
})
// valider les champs du formulaire
function validerFormulaire(){
    let valide=true;

    const title=document.getElementById("title").value.trim();
    const type=document.getElementById("type").value;
    const releaseYear=Number(document.getElementById("releaseYear").value);
    const image=document.getElementById("image").value.trim();
    const duration=Number(document.getElementById("duration").value)
    const seasons=Number(document.getElementById("seasons").value)

    // récupérer l'année actuelle
    const anneeActuelle=new Date().getFullYear();

    // vérifier le titre
    if(title===""){
        document.getElementById("error-title").textContent="Le titre est obligatoire.";
        valide=false;
    }else{
        document.getElementById("error-title").textContent="";
    }

    // vérifier le type
    if(type===""){
        document.getElementById("error-type").textContent="Le type est obligatoire.";
        valide=false;
    }else{
        document.getElementById("error-type").textContent="";
    }

    // vérifier l'année
    if(!releaseYear || releaseYear<1900 || releaseYear>anneeActuelle){
        document.getElementById("error-releaseYear").textContent="L'année doit être comprise entre 1900 et "+anneeActuelle+ ".";
        valide=false;
    }else{
        document.getElementById("error-releaseYear").textContent="";
    }

    // vérifier l'URL
    try{
        const url=new URL(image);

        if(url.protocol!=="http:" && url.protocol!=="https:"){
            throw new Error("URL invalide");
        }
        document.getElementById("error-image").textContent="";
    }catch(error){
        document.getElementById("error-image").textContent="Une URL valide est obligatoire.";
        valide=false;
    }
    // vérifier la durée
    if(type==="movie"){
        if(!duration || duration <= 0){
            document.getElementById("error-duration").textContent="La durée du film obligatoire";
            valide=false
        }else{
            document.getElementById("error-duration").textContent="";
        }
        // effacer erreur des saisons
        document.getElementById("error-seasons").textContent="";
    }
    // vérifier nombre saisons
    if(type==="series"){
        if(!seasons || seasons <=0){
            document.getElementById("error-seasons").textContent="Le nombre de saisons est obligatoire."
            valide=false;
        }else{
            document.getElementById("error-seasons").textContent="";
        }
    }
     return valide
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
    // vérifier les champs avant envoyer les donnes
    if (!validerFormulaire()) {
        return
    }
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