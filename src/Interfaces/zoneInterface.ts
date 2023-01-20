import { ObjectId, Schema } from 'mongoose';

export interface IZone {
  _id: ObjectId;
  createdAt: Date;
  zoneName: string;
  settingsId: ObjectId;
  camera: string;
  connection: string;
}

export const ZoneSchema = new Schema({
  _id: String,
  createdAt: { type: Date, default: Date.now },
  zoneName: String,
  zoneType: String,
  settingsId: String,
  camera: String,
});
