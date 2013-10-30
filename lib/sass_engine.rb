require 'sass'

class SassEngine < Sinatra::Base

  set :views, File.join(root, '..', 'assets', 'stylesheets')

  get '/stylesheets/:name.css' do |name|
    content_type :css
    scss name.to_sym, layout: false
  end

end
