import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DistrictsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.district.findMany();
    }

    async findSpecific(id: string) {
        return this.prisma.district.findUnique({
            where: {
                id: id
            }
        })
    }


    async findCrimesByDistrict(districtId: string): Promise<any> {
        return this.prisma.crime.findMany({
            where: {
                district_id: districtId,
            },
        });
    }



    async findCrimeByDistrict(districtId: string, crimeId: string): Promise<any> {
        try {
            return await this.prisma.crime.findUnique({
                where: {
                    id: crimeId,
                    district_id: districtId,
                },
            });
        } catch (error) {
            console.error(error)
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }

    async createCrime(districtId: string, data: any): Promise<any> {
        try {
            return await this.prisma.crime.create({
                data: {
                    ...data,
                    district_id: districtId, // Ensure the crime is associated with the correct district
                },
            });
        } catch (error) {
            console.error(error)
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }

    async updateCrime(crimeId: string, districtId: string, data: any): Promise<any> {
        try {
            return await this.prisma.crime.update({
                where: {
                    id: crimeId,
                    district_id: districtId, // Ensure the update is for the correct crime within the correct district
                },
                data: data,
            });
        } catch (error) {
            console.error(error)
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteCrime(districtId: string, crimeId: string): Promise<any> {
        try {
            return await this.prisma.crime.delete({
                where: {
                    id: crimeId,
                    district_id: districtId,
                },
            });
        } catch (error) {
            console.error(error)
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteDistrict(districtId: string): Promise<any> {
        try {
            return await this.prisma.district.delete({
                where: {
                    id: districtId,
                },
            });
        } catch (error) {
            console.error(error)
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }
}
