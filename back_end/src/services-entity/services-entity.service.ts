import { Injectable } from '@nestjs/common';
import { CreateServicesEntityDto } from './dto/create-services-entity.dto';
import { UpdateServicesEntityDto } from './dto/update-services-entity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesEntity } from './entities/services-entity.entity';
import { Like } from 'typeorm';


@Injectable()
export class ServicesEntityService {
  constructor(
    @InjectRepository(ServicesEntity)
    private readonly serviceRepo: Repository<ServicesEntity>,
  ) {}
 async create(createServicesEntityDto: CreateServicesEntityDto): Promise<ServicesEntity>  {
     const service = await this.serviceRepo.create(createServicesEntityDto)
     return this.serviceRepo.save(service)
  }

  async findAll(): Promise<ServicesEntity[]>{
     return await this.serviceRepo.find();
     
    
  }

 async findOne(id: number): Promise<ServicesEntity | null>{
    return await this.serviceRepo.findOneBy({service_id:id})
  }

 async update(id: number, updateServicesEntityDto: UpdateServicesEntityDto): Promise<ServicesEntity | null> {
   await this.serviceRepo.update(id, updateServicesEntityDto);
   return this.findOne(id)
  }

 async remove(id: number):  Promise<void> {
    await this.serviceRepo.delete(id)
  }

 

  async searchService(term: string): Promise<ServicesEntity[]> {
    if (!term || !term.trim()) {
      return this.findAll();
    }
  
    const likeTerm = `%${term.toLowerCase()}%`;
  
    return this.serviceRepo
      .createQueryBuilder('t')
  
      .where('CAST(t.service_id AS CHAR) LIKE :term', { term: likeTerm })
      
      .orWhere('LOWER(t.nom_service) LIKE :term', { term: likeTerm })
    
      .orWhere('LOWER(t.description_service) LIKE :term', { term: likeTerm })
      
      .getMany();
  }
  

}
