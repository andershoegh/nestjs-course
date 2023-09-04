import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaSync1692483344964 implements MigrationInterface {
  name = 'SchemaSync1692483344964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coffee" ADD "countryOfOrigin" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coffee" DROP COLUMN "countryOfOrigin"`,
    );
  }
}
