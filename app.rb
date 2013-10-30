require 'sinatra/base'
require './lib/sass_engine'

require 'debugger'

module AudioPlayer
  class Application < Sinatra::Base

    set :root, File.dirname(__FILE__)

    use SassEngine
    use Rack::Logger

    set :views,       File.join(root, '/views')
    set :public_dir,  File.join(root, '/public')

    helpers do
      def logger
        request.logger
      end
    end

    not_found do
      redirect '/404.html'
    end

    get "/" do
      erb :index
    end

  end
end
