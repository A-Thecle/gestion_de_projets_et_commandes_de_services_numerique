import "reflect-metadata";
import { DataSource } from "typeorm";
import { Commande } from "./src/commandes/entities/commande.entity";
import { Utilisateur } from "./src/utilisateurs/entities/utilisateur.entity";
import { ServicesEntity } from "./src/services-entity/entities/services-entity.entity";
import { Projet } from "./src/projets/entities/projet.entity";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "gestion_commandes",
    entities: [Utilisateur, ServicesEntity, Commande, Projet],
    migrations: ["./src/migrations/*{.ts,.js}"],
    synchronize: false,
});
