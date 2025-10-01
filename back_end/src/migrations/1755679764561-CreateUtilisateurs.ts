import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUtilisateurs1755679764561 implements MigrationInterface {
    name = 'CreateUtilisateurs1755679764561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`utilisateurs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code_utilisateur\` varchar(255) NOT NULL, \`nom\` varchar(255) NOT NULL, \`prenom\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`mot_de_passe\` varchar(255) NOT NULL, \`telephone\` int NOT NULL, \`role\` enum ('admin', 'client') NOT NULL DEFAULT 'client', UNIQUE INDEX \`IDX_b371b482b639054f5008f62d80\` (\`code_utilisateur\`), UNIQUE INDEX \`IDX_6b14325a486fe68d16aa889e4d\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Services\` (\`service_id\` int NOT NULL AUTO_INCREMENT, \`nom_service\` varchar(255) NOT NULL, \`description_service\` varchar(255) NOT NULL, \`prix_estime\` int NOT NULL, PRIMARY KEY (\`service_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`commandes\` (\`commandes_id\` varchar(255) NOT NULL, \`description_besoins\` text NOT NULL, \`fichier_joint\` varchar(255) NULL, \`statut_commande\` enum ('en_attente', 'acceptee', 'refusee') NOT NULL DEFAULT 'en_attente', \`date_commande\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_livraison\` timestamp NULL, \`montant_final\` decimal(10,2) NULL, \`mode_paiement\` enum ('Mvola', 'OrangeMoney', 'AirtelMoney', 'CarteBancaire') NULL, \`client_id\` int NULL, \`service_id\` int NULL, PRIMARY KEY (\`commandes_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`commandes\` ADD CONSTRAINT \`FK_52627ef53b2b96fe3aa1e6cf0ef\` FOREIGN KEY (\`client_id\`) REFERENCES \`utilisateurs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commandes\` ADD CONSTRAINT \`FK_eb9f7c4623fed75939b92220b39\` FOREIGN KEY (\`service_id\`) REFERENCES \`Services\`(\`service_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`commandes\` DROP FOREIGN KEY \`FK_eb9f7c4623fed75939b92220b39\``);
        await queryRunner.query(`ALTER TABLE \`commandes\` DROP FOREIGN KEY \`FK_52627ef53b2b96fe3aa1e6cf0ef\``);
        await queryRunner.query(`DROP TABLE \`commandes\``);
        await queryRunner.query(`DROP TABLE \`Services\``);
        await queryRunner.query(`DROP INDEX \`IDX_6b14325a486fe68d16aa889e4d\` ON \`utilisateurs\``);
        await queryRunner.query(`DROP INDEX \`IDX_b371b482b639054f5008f62d80\` ON \`utilisateurs\``);
        await queryRunner.query(`DROP TABLE \`utilisateurs\``);
    }

}
