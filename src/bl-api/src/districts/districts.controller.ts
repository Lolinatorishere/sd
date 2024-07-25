import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/put-district.dto';
import { CreateCrimeDto } from './dto/create-crime.dto'; 
import { UpdateCrimeDto } from './dto/put-crime.dto'; 
import { DistrictsService } from './districts.service';

@Controller('districts')
export class DistrictsController {
    constructor(private readonly districtService: DistrictsService) { }

    @Get()
    getDistricts() {
        return this.districtService.findAll();
    }

    @Get(':id')
    getAnDistrict(@Param('id') id: string) {
        return this.districtService.findSpecific(id);
    }

    @Get(':id/crimes')
    getCrimesByDistrict(@Param('id') districtId: string) {
        return this.districtService.findCrimesByDistrict(districtId);
    }

    @Get(':districtId/crimes/:crimeId')
    getCrimeByDistrict(@Param('districtId') districtId: string, @Param('crimeId') crimeId: string) {
        return this.districtService.findCrimeByDistrict(districtId, crimeId);
    }

    @Post(':districtId/crimes')
    createCrime(@Param('districtId') districtId: string, @Body() createCrimeDto: CreateCrimeDto) {
        return this.districtService.createCrime(districtId, createCrimeDto);
    }

    @Put(':districtId/crimes/:crimeId')
    updateCrime(
        @Param('districtId') districtId: string,
        @Param('crimeId') crimeId: string,
        @Body() updateCrimeDto: UpdateCrimeDto
    ) {
        return this.districtService.updateCrime(districtId, crimeId, updateCrimeDto);
    }

    @Delete(':districtId/crimes/:crimeId')
    deleteCrime(@Param('districtId') districtId: string, @Param('crimeId') crimeId: string) {
        return this.districtService.deleteCrime(districtId, crimeId);
    }
}
