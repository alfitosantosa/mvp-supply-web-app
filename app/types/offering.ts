

export interface offeringTable {
    offeringId: number;
    offeringName: string;
    offeringDesc: string;
    offeringPrice: number;
}


export interface offeringForm extends offeringTable {
    offeringQuantity: number;
    offeringImg: string;
    

}