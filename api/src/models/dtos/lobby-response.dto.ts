import { ApiProperty } from '@nestjs/swagger';

export class LobbyResponse {
  id!: string;
  name!: string;
  @ApiProperty({
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'boolean'
      }
    }
  })
  pixelMap!: boolean[][];
}
