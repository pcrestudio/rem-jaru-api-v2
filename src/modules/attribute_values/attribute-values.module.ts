import { Module } from "@nestjs/common";
import { AttributeValuesController } from "./attribute-values.controller";
import { AttributeValuesService } from "./attribute-values.service";

@Module({
  providers: [AttributeValuesService],
  controllers: [AttributeValuesController],
})
export class AttributeValuesModule {}
