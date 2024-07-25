import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DistrictsController } from './districts.controller';
import { DistrictsService } from './districts.service';

@Module({
  imports: [HttpModule],
  controllers: [DistrictsController],
  providers: [DistrictsService]
})
export class DistrictsModule {}
