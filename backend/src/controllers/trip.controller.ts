import { BaseController } from './base.controller';
import { TripService } from '../services/trip.service';
import { ITrip } from '../models/trip.model';

export class TripController extends BaseController<ITrip> {
  constructor() {
    super(new TripService());
  }
}
