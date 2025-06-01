// import mongoose, { Schema, Document } from 'mongoose';

// export interface IProperty extends Document {
//   id: string;
//   title: string;
//   type: string;
//   price: number;
//   state: string;
//   city: string;
//   areaSqFt: number;
//   bedrooms: number;
//   bathrooms: number;
//   amenities: string[];
//   furnished: string;
//   availableFrom: Date;
//   listedBy: string;
//   tags: string[];
//   colorTheme: string;
//   rating: number;
//   isVerified: boolean;
//   listingType: string;
//   createdBy: mongoose.Types.ObjectId;
// }

// const propertySchema = new Schema<IProperty>({
//   id: { type: String, required: true, unique: true }, // ✅ Custom ID
//   title: { type: String, required: true },
//   type: { type: String, required: true },
//   price: { type: Number, required: true },
//   state: { type: String },
//   city: { type: String },
//   areaSqFt: { type: Number },
//   bedrooms: { type: Number },
//   bathrooms: { type: Number },
//   amenities: [{ type: String }],
//   furnished: { type: String },
//   availableFrom: { type: Date },
//   listedBy: { type: String },
//   tags: [{ type: String }],
//   colorTheme: { type: String },
//   rating: { type: Number },
//   isVerified: { type: Boolean },
//   listingType: { type: String },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// }, {
//   timestamps: true
// });


  // propertySchema.index({ city: 1, state: 1, type: 1, listingType: 1, price: 1 });
  // propertySchema.index({ amenities: 1 });
  // propertySchema.index({ tags: 1 });

  // export default mongoose.model<IProperty>('Property', propertySchema);



import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  id: string;
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: string;
  availableFrom: Date;
  listedBy: string;
  tags: string[];
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: string;
  createdBy: mongoose.Types.ObjectId;
}

const propertySchema = new Schema<IProperty>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  state: { type: String },
  city: { type: String },
  areaSqFt: { type: Number },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  amenities: [{ type: String }],
  furnished: { type: String },
  availableFrom: { type: Date },
  listedBy: { type: String },
  tags: [{ type: String }],
  colorTheme: { type: String },
  rating: { type: Number },
  isVerified: { type: Boolean },
  listingType: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});



  propertySchema.index({ city: 1, state: 1, type: 1, listingType: 1, price: 1 });
  propertySchema.index({ amenities: 1 });
  propertySchema.index({ tags: 1 });

  export default mongoose.model<IProperty>('Property', propertySchema);