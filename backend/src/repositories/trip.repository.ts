import { BaseRepository } from './base.repository';
import { Trip, ITrip } from '../models/trip.model';

export class TripRepository extends BaseRepository<ITrip> {
  constructor() {
    super(Trip);
  }
}
