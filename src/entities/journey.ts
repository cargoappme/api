import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm'
import {Position} from './position'

@Entity()
export class Journey {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  token: string

  @Column()
  secret: string

  @Column()
  startDate: Date

  @Column({ nullable: true })
  endDate: Date

  @Column('decimal', { precision: 10, scale: 6 })
  startLat: number

  @Column('decimal', { precision: 10, scale: 6 })
  startLong: number

  @Column('decimal', { precision: 10, scale: 6 })
  endLat: number

  @Column('decimal', { precision: 10, scale: 6 })
  endLong: number

  @Column({ default: false })
  isFinished: boolean

  @OneToMany(type => Position, position => position.journey)
  positions: Promise<Position[]>
}
