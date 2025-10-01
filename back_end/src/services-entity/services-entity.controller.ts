import { Controller, Get, Post, Body, Patch, Param, Delete, Search, Query } from '@nestjs/common';
import { ServicesEntityService } from './services-entity.service';
import { CreateServicesEntityDto } from './dto/create-services-entity.dto';
import { UpdateServicesEntityDto } from './dto/update-services-entity.dto';

@Controller('services')
export class ServicesEntityController {
  constructor(private readonly servicesEntityService: ServicesEntityService) {}

  @Post()
  createService(@Body() createServicesEntityDto: CreateServicesEntityDto) {
    return this.servicesEntityService.create(createServicesEntityDto);
  }

  @Get()
  findAllService() {
    return this.servicesEntityService.findAll();
  }

   @Get("search")
  searchService (@Query("term")term:string){
    return this.servicesEntityService.searchService(term)
  }


  @Get(':id')
  findOneService(@Param('id') id: string) {
    return this.servicesEntityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicesEntityDto: UpdateServicesEntityDto) {
    return this.servicesEntityService.update(+id, updateServicesEntityDto);
  }

  @Delete(':id')
  removeService(@Param('id') id: string) {
    return this.servicesEntityService.remove(+id);
  }

 
}
