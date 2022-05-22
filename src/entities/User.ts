import { Field, Int, ObjectType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
} from "typeorm";

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

	@CreateDateColumn()
		createdAt: string;
}
