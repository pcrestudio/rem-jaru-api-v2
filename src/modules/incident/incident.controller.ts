import { Body, Controller, Post } from "@nestjs/common";
import { IncidentService } from "./incident.service";
import { UpsertIncidentDto } from "./dto/upsert-incident.dto";
import { UpsertIncidentDataDto } from "./dto/upsert-incident-data.dto";

@Controller("incident")
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post("bulk")
  async bulkIncidents(@Body() incidents: UpsertIncidentDto[]) {
    return this.incidentService.bulkIncidents(incidents);
  }

  @Post("upsert/incidentData")
  async upsertIncidentData(@Body() incidents: UpsertIncidentDataDto[]) {
    return this.incidentService.upsertIncidentData(incidents);
  }
}
