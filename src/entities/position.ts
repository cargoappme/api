import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Journey} from './journey'

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  date: Date

  @Column('decimal', { precision: 10, scale: 6 })
  lat: number

  @Column('decimal', { precision: 10, scale: 6 })
  long: number

  @ManyToOne(type => Journey, journey => journey.positions)
  journey: Journey
}
