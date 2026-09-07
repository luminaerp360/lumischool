import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StkPushDto {
  @ApiProperty({ description: "Phone number in 254XXXXXXXXX format" })
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsMongoId()
  invoiceId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionDesc?: string;
}

export class MpesaCallbackDto {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export class C2BValidationDto {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
}

export class C2BConfirmationDto extends C2BValidationDto {}
