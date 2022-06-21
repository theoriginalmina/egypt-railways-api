import { Column, Entity, PrimaryColumn } from "typeorm";

// prettier-ignore
@Entity("non_egyptions")
export class NonEgyption {
    @PrimaryColumn()
    	key: string;

    @Column()
    	passportNumber:string;
}
