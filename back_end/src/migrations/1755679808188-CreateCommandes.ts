import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommandes1755679808188 implements MigrationInterface {
    name = 'CreateCommandes1755679808188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`commandes\` DROP FOREIGN KEY \`FK_eb9f7c4623fed75939b92220b39\``);
        await queryRunner.query(`CREATE TABLE \`Services\` (\`service_id\` int NOT NULL AUTO_INCREMENT, \`nom_service\` varchar(255) NOT NULL, \`description_service\` varchar(255) NOT NULL, \`prix_estime\` int NOT NULL, PRIMARY KEY (\`service_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`commandes\` ADD CONSTRAINT \`FK_eb9f7c4623fed75939b92220b39\` FOREIGN KEY (\`service_id\`) REFERENCES \`Services\`(\`service_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`commandes\` DROP FOREIGN KEY \`FK_eb9f7c4623fed75939b92220b39\``);
        await queryRunner.query(`DROP TABLE \`Services\``);
        await queryRunner.query(`ALTER TABLE \`commandes\` ADD CONSTRAINT \`FK_eb9f7c4623fed75939b92220b39\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`service_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
