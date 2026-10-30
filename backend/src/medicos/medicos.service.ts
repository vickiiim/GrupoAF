import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
  ) {}

  // Consulta la base de datos y trae los médicos con sus datos de usuario
  async findAll() {
  return await this.medicoRepository.find({
    relations: { usuario: true } 
  });
  }

  // Actualiza el valor de la consulta en la base de datos
  async updateTarifa(idMedico: number, nuevoValor: number) {
    const medico = await this.medicoRepository.findOne({ where: { id: idMedico } });

    if (!medico) {
      throw new NotFoundException(`El médico con ID ${idMedico} no existe`);
    }

    medico.valorConsulta = nuevoValor;
    return await this.medicoRepository.save(medico);
  }
}