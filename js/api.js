const API_URL="https://6afaf07b730c1d152f32cb64.mockapi.io/api/v1";

export async function chargerDonnees() {
    try{
        const response = await fetch(API_URL+"/contents");
        if(!response.ok){
            throw new Error("erreur API");
        }
        const donnees = await response.json();
        return donnees;
    } catch (error){
        console.error("erreur du chargement des données :",error);
        throw error;
    }
}

