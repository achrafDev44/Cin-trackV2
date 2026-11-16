const API_URL="https://6afaf07b730c1d152f32cb64.mockapi.io/api/v1";

export async function chargerDonnees() {
    try{
        const donnees = await request("/contents");
        return donnees;
    } catch (error){
        console.error("Erreur du chargement des données :",error);
        throw error;
    }
}

export async function request(path, option = {}) {
    const response = await fetch(API_URL + path, {
        headers: { "Content-type": "application/json" },
        ...option,
    });
    if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
    }
    return response.json();
}
// permet ajouter un nouveau film ou serie dans mokApi
export async function createContent(data) {
    return await request("/content" ,{
        method:"Post",
        body: JSON.stringify(data)
    });  
}

// permet de modifier un film ou un serie deja enregistrer dans mokApi
export async function updateContent(id,data) {
    return await request (`/contents/${id}`,{
        method:"PUT",
        body:JSON.stringify(data)
    });   
}

// permet de supprimer un film ou un serie de mockAPI
export async function deleteContent(id) {
    return await request(`contents/${id}`,{
        method:"DELETE"
    })   
}

// permet de recuperer tous les commantaires
export async function getComments() {
    return await request("/comments"); 
}



