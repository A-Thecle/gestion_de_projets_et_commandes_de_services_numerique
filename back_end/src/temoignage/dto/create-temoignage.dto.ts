import { IsInt, IsString, Min, Max, MinLength } from "class-validator";

export class CreateTemoignageDto {
  @IsInt()
  id_client!: number;

  @IsString()
  id_projet!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  note!: number;

  @IsString()
  @MinLength(20, { message: "Le commentaire doit contenir au moins 20 caractères" })
  commentaire!: string;
}
