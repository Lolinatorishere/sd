import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CreateCrimeDto } from './dto/create-crime.dto';
import { UpdateCrimeDto } from './dto/put-crime.dto';
import { DistrictsService } from './districts.service';
import { AdminGuard } from './admin.guard'; // Import AdminGuard
import { AuthGuard } from './auth.guard'; // Import AdminGuard
import { LoginGuard } from './login.guard'; // Import AdminGuard

@Controller('districts')
export class DistrictsController {
    constructor(private readonly districtService: DistrictsService) { }

    //@UseGuards(LoginGuard)
    @Get()
    getDistricts() {
        return this.districtService.findAll();
    }

    //@UseGuards(LoginGuard)
    @Get(':id')
    getAnDistrict(@Param('id') id: string) {
        return this.districtService.findSpecific(id);
    }

    //@UseGuards(LoginGuard)
    @Get(':id/crimes')
    getCrimesByDistrict(@Param('id') districtId: string) {
        return this.districtService.findCrimesByDistrict(districtId);
    }

    //@UseGuards(LoginGuard)
    @Get(':districtId/crimes/:crimeId')
    getCrimeByDistrict(@Param('districtId') districtId: string, @Param('crimeId') crimeId: string) {
        return this.districtService.findCrimeByDistrict(districtId, crimeId);
    }

    // Use AdminGuard on this route to restrict access to admins
    //@UseGuards(AuthGuard)
    @Post(':districtId/crimes')
    createCrime(@Param('districtId') districtId: string, @Body() createCrimeDto: CreateCrimeDto) {
        return this.districtService.createCrime(districtId, createCrimeDto);
    }

    //@UseGuards(AuthGuard)
    @Put(':districtId/crimes/:crimeId')
    updateCrime(
        @Param('districtId') districtId: string,
        @Param('crimeId') crimeId: string,
        @Body() updateCrimeDto: UpdateCrimeDto
    ) {
        return this.districtService.updateCrime(crimeId, districtId, updateCrimeDto);
    }

    //@UseGuards(AdminGuard)
    @Delete(':districtId/crimes/:crimeId')
    deleteCrime(@Param('districtId') districtId: string, @Param('crimeId') crimeId: string) {
        return this.districtService.deleteCrime(districtId, crimeId);
    }
}
