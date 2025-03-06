import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { IncidentService } from "./incident.service";
import { UpsertIncidentDto } from "./dto/upsert-incident.dto";
import { UpsertIncidentDataDto } from "./dto/upsert-incident-data.dto";
import { FilterIncidenceDto } from "./dto/filter-incidence.dto";

@Controller("incident")
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post("bulk")
  async bulkIncidents(@Body() incidents: UpsertIncidentDto[]) {
    return this.incidentService.bulkIncidents(incidents);
  }

  @Post("upsert")
  async upsertIncidence(@Body() incidence: UpsertIncidentDto) {
    return this.incidentService.upsertIncidence(incidence);
  }

  @Get("")
  async getIncidences(@Query() filter: FilterIncidenceDto) {
    return this.incidentService.getIncidences(filter);
  }

  @Post("upsert/incidentData")
  async upsertIncidentData(@Body() incidents: UpsertIncidentDataDto[]) {
    return this.incidentService.upsertIncidentData(incidents);
  }

  @Get("incidence/data")
  async getIncidenceData() {
    return this.incidentService.getIncidenceData();
  }
}
