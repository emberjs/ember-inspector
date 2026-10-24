import Model, { attr } from '@warp-drive/legacy/model';

export default class Post extends Model {
  @attr('string') title;
}
