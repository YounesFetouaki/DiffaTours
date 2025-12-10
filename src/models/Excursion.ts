import mongoose, { Document, Schema } from 'mongoose';

export interface IExcursionItem {
  id: string;
  label: string;
  price: number;
  defaultChecked: boolean;
}

export type ExcursionSection = 'marrakech' | 'agadir' | 'taghazout' | 'circuits';

export interface ITimeSlot {
  startTime: string; // e.g., "07:30"
  endTime: string;   // e.g., "18:30"
}

// Multilingual text can be either a string or an object with language keys
export type MultilingualText = string | {
  en?: string;
  fr?: string;
  es?: string;
  it?: string;
};

export interface IExcursion extends Document {
  id: string;
  name: MultilingualText;
  section: ExcursionSection;
  images: string[];
  priceMAD: number;
  location: MultilingualText;
  duration: MultilingualText;
  groupSize: string;
  rating: number;
  description: MultilingualText;
  items: IExcursionItem[];
  ageGroups: boolean;
  highlights: MultilingualText[];
  included: MultilingualText[];
  notIncluded: MultilingualText[];
  // Schedule fields
  availableDays: string[]; // e.g., ["monday", "tuesday", "wednesday"] or ["everyday"]
  timeSlots: ITimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const excursionItemSchema = new Schema<IExcursionItem>({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  defaultChecked: {
    type: Boolean,
    default: false,
  },
});

const timeSlotSchema = new Schema<ITimeSlot>({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
}, { _id: false });

const excursionSchema = new Schema<IExcursion>(
  {
    id: {
      type: String,
      required: [true, 'Excursion ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: Schema.Types.Mixed,
      required: [true, 'Name is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      enum: ['marrakech', 'agadir', 'taghazout', 'circuits'],
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one image is required',
      },
    },
    priceMAD: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    location: {
      type: Schema.Types.Mixed,
      required: [true, 'Location is required'],
    },
    duration: {
      type: Schema.Types.Mixed,
      required: [true, 'Duration is required'],
    },
    groupSize: {
      type: String,
      required: [true, 'Group size is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    description: {
      type: Schema.Types.Mixed,
      required: [true, 'Description is required'],
    },
    items: {
      type: [excursionItemSchema],
      default: [],
    },
    ageGroups: {
      type: Boolean,
      default: true,
    },
    highlights: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    included: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    notIncluded: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    availableDays: {
      type: [String],
      default: ['everyday'], // Default to available every day
    },
    timeSlots: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
export const Excursion = mongoose.models.Excursion || mongoose.model<IExcursion>('Excursion', excursionSchema);