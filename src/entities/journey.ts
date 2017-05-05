import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class Journey {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  token: string

  @Column()
  secret: string

  @Column({ default: false })
  isDone: boolean
}
