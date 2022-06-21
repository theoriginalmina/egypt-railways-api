import { Field, Int, ObjectType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	// OneToOne,
	// JoinColumn,
} from "typeorm";
// import { Egyptian } from "./Egyptian";

// prettier-ignore
@ObjectType()
@Entity("users")
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
		id: number;

	@Field()
	@Column({ unique: true })
		email: string;

	@Column()
		password: string;

	@Column({ nullable: true })
		firstName: string;

	@Column({ nullable: true })
		lastName:string;

	@Column({ nullable: true, type:"varchar", unique:true })
		phoneNumber: number;

	@Column({ nullable: true })
		egyptian: boolean;

	@Column({ nullable: true })
		active: boolean;

	@CreateDateColumn()
		createdAt: string;

	// @OneToOne(() => Egyptian)
	// @JoinColumn()
	// 	egypt: Egyptian;
}
