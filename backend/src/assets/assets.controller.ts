// backend/src/assets/assets.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  Param,
  Delete,
  Patch,
  NotFoundException,
  Put,
  BadRequestException,
  Res,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateFromSampleDto } from './dto/create-from-sample.dto';
import { FilterAssetsDto } from './dto/filter-assets.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { join } from 'path';
import { readdirSync } from 'fs';
import * as qr from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Response } from 'express';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/foto-barang',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      message: 'File uploaded successfully',
      url: `/uploads/foto-barang/${file.filename}`,
      filename: file.filename,
    };
  }

  @Post('upload-document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/dokumen',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Izinkan file PDF, DOC, DOCX
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return cb(
            new Error('Only PDF, DOC, and DOCX files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No document uploaded');
    }

    return {
      message: 'Document uploaded successfully',
      url: `/uploads/dokumen/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get('qrcodes')
  getQRCodes() {
    const qrcodesDir = join(process.cwd(), 'uploads', 'qrcodes');
    try {
      const files = readdirSync(qrcodesDir);
      return files.map((file) => ({
        filename: file,
        url: `/uploads/qrcodes/${file}`,
      }));
    } catch (error) {
      throw new NotFoundException('Folder QR codes tidak ditemukan');
    }
  }

  @Post()
  async create(@Body(new ValidationPipe()) createAssetDto: CreateAssetDto) {
    try {
      const assets = await this.assetsService.create(createAssetDto);

      return {
        message: `Berhasil membuat ${assets.length} aset dengan QR Code`,
        data: assets,
      };
    } catch (error) {
      throw new BadRequestException(`Gagal membuat aset: ${error.message}`);
    }
  }

  @Post('create-from-sample')
  async createFromSample(
    @Body(new ValidationPipe()) createFromSampleDto: CreateFromSampleDto,
  ) {
    try {
      const assets =
        await this.assetsService.createFromSampleData(createFromSampleDto);

      return {
        message: `Berhasil membuat ${assets.length} aset dari sample data`,
        data: assets,
        sample_format: 'U21/LAB301/FT.3/PC.{n}/2025',
        generated_codes: assets.map((asset) => asset.kode_aset),
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal membuat aset dari sample: ${error.message}`,
      );
    }
  }

  @Post('create-your-sample')
  async createYourSample() {
    try {
      const assets = await this.assetsService.createFromYourSample();

      return {
        message: `Berhasil membuat ${assets.length} aset dari sample data Anda`,
        data: assets,
        expected_format: 'U21/LAB301/FT.3/PC.{n}/2025',
        generated_codes: assets.map((asset) => asset.kode_aset),
        is_correct_format: assets.every(
          (asset) =>
            asset.kode_aset.startsWith('U21/LAB301/FT.3/PC.') &&
            asset.kode_aset.endsWith('/2025'),
        ),
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal membuat sample aset: ${error.message}`,
      );
    }
  }

  @Get('filter/by-criteria')
  async findByCriteria(@Query() filterAssetsDto: FilterAssetsDto) {
    try {
      const assets =
        await this.assetsService.findAssetsByCriteria(filterAssetsDto);
      return {
        success: true,
        message: 'Berhasil mendapatkan data aset',
        data: assets,
        total: assets.length,
      };
    } catch (error) {
      throw new BadRequestException(`Gagal filter aset: ${error.message}`);
    }
  }

  @Get('test-format')
  async testFormat() {
    try {
      const assets = await this.assetsService.createFromYourSample();

      const generatedCodes = assets.map((asset) => asset.kode_aset);
      const expectedPattern = /^U21\/LAB301\/FT\.3\/PC\.\d+\/2025$/;

      const formatCheck = {
        total_assets: assets.length,
        expected_format: 'U21/LAB301/FT.3/PC.{n}/2025',
        generated_codes: generatedCodes,
        all_correct_format: generatedCodes.every((code) =>
          expectedPattern.test(code),
        ),
        sample_correct: generatedCodes[0] === 'U21/LAB301/FT.3/PC.1/2025',
        sample_correct_last: generatedCodes[9] === 'U21/LAB301/FT.3/PC.10/2025',
      };

      return {
        message: 'Test format kode aset berhasil',
        ...formatCheck,
      };
    } catch (error) {
      throw new BadRequestException(`Gagal test format: ${error.message}`);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.assetsService.findAll();
    } catch (error) {
      console.error('Error in AssetsController.findAll:', error);
      throw new BadRequestException(`Failed to fetch assets: ${error.message}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const asset = await this.assetsService.findOne(+id);
      return asset;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Gagal mengambil aset: ${error.message}`);
    }
  }

  @Get(':id/qrcode')
  async getQRCode(@Param('id') id: string, @Res() res: Response) {
    try {
      const asset = await this.assetsService.findOne(+id);

      if (!asset.file_qrcode) {
        throw new NotFoundException('QR Code untuk aset ini tidak ditemukan');
      }

      const qrCodePath = path.join(process.cwd(), asset.file_qrcode);
      const qrCodeBuffer = await fs.readFile(qrCodePath);

      res.set({
        'Content-Type': 'image/png',
        'Content-Length': qrCodeBuffer.length,
      });

      res.send(qrCodeBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Gagal mengambil QR Code: ${error.message}`,
      );
    }
  }

  @Get(':id/document')
  async getDocument(@Param('id') id: string, @Res() res: Response) {
    try {
      const asset = await this.assetsService.findOne(+id);

      if (!asset.file_dokumen) {
        throw new NotFoundException('Dokumen untuk aset ini tidak ditemukan');
      }

      const documentPath = path.join(process.cwd(), asset.file_dokumen);
      const documentBuffer = await fs.readFile(documentPath);

      // Tentukan content type berdasarkan ekstensi file
      const ext = path.extname(asset.file_dokumen).toLowerCase();
      let contentType = 'application/octet-stream';

      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.doc') {
        contentType = 'application/msword';
      } else if (ext === '.docx') {
        contentType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      res.set({
        'Content-Type': contentType,
        'Content-Length': documentBuffer.length,
        'Content-Disposition': `inline; filename="${path.basename(asset.file_dokumen)}"`,
      });

      res.send(documentBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Gagal mengambil dokumen: ${error.message}`,
      );
    }
  }

  @Post(':id/regenerate-qrcode')
  async regenerateQRCode(@Param('id') id: string) {
    try {
      const asset = await this.assetsService.findOne(+id);

      const qrCodeBuffer = await qr.toBuffer(asset.kode_aset, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      const uploadDir = path.join(process.cwd(), 'uploads', 'qrcodes');
      await fs.mkdir(uploadDir, { recursive: true });

      if (asset.file_qrcode) {
        try {
          const oldQrCodePath = path.join(process.cwd(), asset.file_qrcode);
          await fs.unlink(oldQrCodePath);
        } catch (error) {
          console.error('Gagal menghapus QR Code lama:', error);
        }
      }

      const qrCodeFileName = `qrcode-${asset.id_aset}-${Date.now()}.png`;
      const qrCodePath = path.join(uploadDir, qrCodeFileName);
      await fs.writeFile(qrCodePath, qrCodeBuffer);

      const updatedAsset = await this.assetsService.updateQRCodePath(
        asset.id_aset,
        `/uploads/qrcodes/${qrCodeFileName}`,
      );

      return {
        message: 'QR Code berhasil diregenerasi',
        data: updatedAsset,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal meregenerasi QR Code: ${error.message}`,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    const createAssetDto: Partial<CreateAssetDto> = {
      id_item: updateAssetDto.id_item,
      id_lokasi: updateAssetDto.id_lokasi,
      id_unit_kerja: updateAssetDto.id_unit_kerja,
      id_group: updateAssetDto.id_group ?? undefined,
      merk: updateAssetDto.merk,
      tipe_model: updateAssetDto.tipe_model,
      spesifikasi: updateAssetDto.spesifikasi,
      tgl_perolehan: updateAssetDto.tgl_perolehan,
      sumber_dana: updateAssetDto.sumber_dana,
      jumlah: updateAssetDto.jumlah,
      status_aset: updateAssetDto.status_aset,
      kondisi_terakhir: updateAssetDto.kondisi_terakhir,
      foto_barang: updateAssetDto.foto_barang,
      file_dokumen: updateAssetDto.file_dokumen,
    };

    return this.assetsService.update(+id, createAssetDto);
  }

  @Put(':id')
  async updateFull(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    const createAssetDto: Partial<CreateAssetDto> = {
      id_item: updateAssetDto.id_item,
      id_lokasi: updateAssetDto.id_lokasi,
      id_unit_kerja: updateAssetDto.id_unit_kerja,
      id_group: updateAssetDto.id_group ?? undefined,
      merk: updateAssetDto.merk,
      tipe_model: updateAssetDto.tipe_model,
      spesifikasi: updateAssetDto.spesifikasi,
      tgl_perolehan: updateAssetDto.tgl_perolehan,
      sumber_dana: updateAssetDto.sumber_dana,
      jumlah: updateAssetDto.jumlah,
      status_aset: updateAssetDto.status_aset,
      kondisi_terakhir: updateAssetDto.kondisi_terakhir,
      foto_barang: updateAssetDto.foto_barang,
      file_dokumen: updateAssetDto.file_dokumen,
    };

    return this.assetsService.update(+id, createAssetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const asset = await this.assetsService.findOne(+id);

      if (asset.file_qrcode) {
        try {
          const qrCodePath = path.join(process.cwd(), asset.file_qrcode);
          await fs.unlink(qrCodePath);
        } catch (error) {
          console.error('Gagal menghapus QR Code:', error);
        }
      }

      if (asset.foto_barang) {
        try {
          const fotoPath = path.join(process.cwd(), asset.foto_barang);
          await fs.unlink(fotoPath);
        } catch (error) {
          console.error('Gagal menghapus foto barang:', error);
        }
      }

      if (asset.file_dokumen) {
        try {
          const dokumenPath = path.join(process.cwd(), asset.file_dokumen);
          await fs.unlink(dokumenPath);
        } catch (error) {
          console.error('Gagal menghapus dokumen:', error);
        }
      }

      return this.assetsService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Gagal menghapus aset: ${error.message}`);
    }
  }

  @Get('gedung')
  async findAllGedung() {
    try {
      const gedungList = await this.assetsService.findAllGedung();
      return {
        success: true,
        message: 'Berhasil mendapatkan data gedung',
        data: gedungList,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal mendapatkan data gedung: ${error.message}`,
      );
    }
  }

  @Get('unit-kerja/by-gedung/:id_gedung')
  async findUnitKerjaByGedung(
    @Param('id_gedung', ParseIntPipe) id_gedung: number,
  ) {
    try {
      const unitKerjaList =
        await this.assetsService.findUnitKerjaByGedung(id_gedung);
      return {
        success: true,
        message: `Berhasil mendapatkan data unit kerja untuk gedung ID ${id_gedung}`,
        data: unitKerjaList,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal mendapatkan data unit kerja: ${error.message}`,
      );
    }
  }

  @Get('lokasi/by-gedung-unit')
  async findLokasiByGedungAndUnit(
    @Query('gedungId', ParseIntPipe) gedungId: number,
    @Query('unitKerjaId', ParseIntPipe) unitKerjaId: number,
  ) {
    try {
      const lokasiList = await this.assetsService.findLokasiByGedungAndUnit(
        gedungId,
        unitKerjaId,
      );
      return {
        success: true,
        message: `Berhasil mendapatkan data lokasi untuk gedung ID ${gedungId} dan unit kerja ID ${unitKerjaId}`,
        data: lokasiList,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal mendapatkan data lokasi: ${error.message}`,
      );
    }
  }

  @Get('by-location/:id_lokasi')
  async findByLocation(@Param('id_lokasi', ParseIntPipe) id_lokasi: number) {
    try {
      const assets = await this.assetsService.findAllByLocation(id_lokasi);
      return {
        success: true,
        message: `Berhasil mendapatkan data aset untuk lokasi ID ${id_lokasi}`,
        data: assets,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal mendapatkan data aset: ${error.message}`,
      );
    }
  }

  // Endpoints untuk alur filter Kampus -> Gedung -> Lokasi
  @Get('kampus')
  async findAllKampus() {
    try {
      const kampusList = await this.assetsService.findAllKampus();
      return {
        success: true,
        message: 'Berhasil mendapatkan data kampus',
        data: kampusList,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal mendapatkan data kampus: ${error.message}`,
      );
    }
  }

  @Get('gedung/by-kampus/:id_kampus')
  async findGedungByKampus(
    @Param('id_kampus', ParseIntPipe) id_kampus: number,
  ) {
    try {
      const gedungList = await this.assetsService.findGedungByKampus(id_kampus);
      return {
        success: true,
        message: `Berhasil mendapatkan data gedung untuk kampus ID ${id_kampus}`,
        data: gedungList,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal mendapatkan data gedung: ${error.message}`,
      );
    }
  }

  @Get('lokasi/by-gedung/:id_gedung')
  async findLokasiByGedung(
    @Param('id_gedung', ParseIntPipe) id_gedung: number,
  ) {
    try {
      const lokasiList = await this.assetsService.findLokasiByGedung(id_gedung);
      return {
        success: true,
        message: `Berhasil mendapatkan data lokasi untuk gedung ID ${id_gedung}`,
        data: lokasiList,
      };
    } catch (error) {
      throw new BadRequestException(
        `Gagal mendapatkan data lokasi: ${error.message}`,
      );
    }
  }
}
