import type * as image from '../image';
import { Platform } from '../platform';
import { ResourceType } from '../resources';
import { identity } from '../utils/fn';

describe('cordova-res', () => {
  describe('image', () => {
    describe('resolveSourceImage', () => {
      let im: typeof image;
      let fsMock: { [key: string]: jest.Mock };
      let resourcesMock: {
        validateResource: jest.Mock;
        prettyPlatform: (...args: any[]) => any;
        prettyResourceType: (...args: any[]) => any;
      };

      beforeEach(async () => {
        jest.resetModules();

        fsMock = {
          readFile: jest.fn(),
          writeFile: jest.fn(),
        };

        resourcesMock = {
          validateResource: jest.fn(),
          prettyPlatform: identity,
          prettyResourceType: identity,
        };

        jest.mock('@ionic/utils-fs', () => fsMock);
        jest.mock('../resources', () => resourcesMock);

        im = await import('../image');
      });

      it('should throw with empty array of source images', async () => {
        await expect(
          im.resolveSourceImage(Platform.ANDROID, ResourceType.ICON, [], null),
        ).rejects.toThrow('Missing valid source image');
        expect(fsMock.readFile).not.toHaveBeenCalled();
      });

      it('should throw with source image with error', async () => {
        fsMock.readFile.mockImplementation(async () => {
          throw new Error('err');
        });
        await expect(
          im.resolveSourceImage(
            Platform.ANDROID,
            ResourceType.ICON,
            ['blah.png'],
            null,
          ),
        ).rejects.toThrow('Missing valid source image');
        expect(fsMock.readFile).toHaveBeenCalledTimes(1);
      });

      it('should resolve with proper image', async () => {
        fsMock.readFile.mockImplementationOnce(async () => {
          throw new Error('err');
        });
        fsMock.readFile.mockImplementationOnce(async () => Buffer.from([]));
        const { src } = await im.resolveSourceImage(
          Platform.ANDROID,
          ResourceType.ICON,
          ['foo.png', 'bar.png'],
          null,
        );
        expect(src).toEqual('bar.png');
        expect(fsMock.readFile).toHaveBeenCalledTimes(2);
        expect(resourcesMock.validateResource).toHaveBeenCalledTimes(1);
      });
    });
  });
});
