import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProjetTable1680000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "projet",
                columns: [
                    {
                        name: "projet_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "commande_id",
                        type: "varchar",
                        length: "255"
                    },
                    {
                        name: "titre_projet",
                        type: "varchar",
                        length: "255"
                    },
                    {
                        name: "description_projet",
                        type: "text"
                    },
                    {
                        name: "etat",
                        type: "enum",
                        enum: ["en_attente", "en_cours", "en_revision", "termine"],
                        default: "'en_attente'"
                    },
                    {
                        name: "date_livraison_prevue",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "documents_partages",
                        type: "text",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Ajouter la clé étrangère vers la table commandes
        await queryRunner.createForeignKey(
            "projet",
            new TableForeignKey({
                columnNames: ["commande_id"],
                referencedColumnNames: ["commandes_id"],
                referencedTableName: "commandes",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("projet");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("commande_id") !== -1);
        if (foreignKey) await queryRunner.dropForeignKey("projet", foreignKey);
        await queryRunner.dropTable("projet");
    }
}
