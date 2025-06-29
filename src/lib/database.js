import { databases } from "./appwrite";
import { ID } from "appwrite";

const collections = [
    {
        databaseId: import.meta.env.VITE_DATABASE_ID,
        id: import.meta.env.VITE_COLLECTION_ID_PROFILES,
        name: 'profiles'
    },
    {
        databaseId: import.meta.env.VITE_DATABASE_ID,
        id: import.meta.env.VITE_COLLECTION_ID_SHORTLISTS,
        name: 'shortlists'
    },
    {
        databaseId: import.meta.env.VITE_DATABASE_ID,
        id: import.meta.env.VITE_COLLECTION_ID_FAQS,
        name: 'faqs'
    }
]

const db = {}

collections.forEach(col =>{
    db[col.name] = {
        create: (payload, id = ID.unique()) => databases.createDocument(
            col.databaseId,
            col.id,
            id,
            payload
        ),

        update: (id, payload) => databases.updateDocument(
            col.databaseId,
            col.id,
            id,
            payload
        ),

        get: (id)=> databases.getDocument(
            col.databaseId,
            col.id,
            id
        ),

        list: (queries) => databases.listDocuments(
            col.databaseId,
            col.id,
            queries
        ),

        delete: (id)=> databases.deleteDocument(
            col.databaseId,
            col.id,
            id
        )
    }
})

export {db}