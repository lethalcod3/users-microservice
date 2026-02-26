import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UserStatsDocument = HydratedDocument<UserStats>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class UserStats {
  @Prop({ required: true })
  sqlUserId!: string;

  @Prop({ default: 0 })
  profileViews!: number;
}
export const UserStatsSchema = SchemaFactory.createForClass(UserStats);
