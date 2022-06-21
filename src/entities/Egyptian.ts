import { Column, Entity, PrimaryColumn } from "typeorm";

// prettier-ignore
@Entity("egyptians")
export class Egyptian {
	@PrimaryColumn()
		key:string;

	@Column()
		nationalID: string;
}
